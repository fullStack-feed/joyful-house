import React, {useState, FormEvent} from "react";
import { Link, Redirect } from "react-router-dom";
import {Button, Form, Icon, Input, InputNumber, Layout, Radio, Typography, Upload} from "antd";
import {UploadChangeParam} from "antd/lib/upload";
import {FormComponentProps} from "antd/lib/form";
import {iconColor, displayErrorMessage, displaySuccessNotification} from "../../lib/utils";
import {Viewer} from "../../lib/types";
import {ListingType} from "../../lib/graphql/globalTypes";

import {useMutation} from "@apollo/react-hooks";
import {HOST_LISTING} from "../../lib/graphql/mutations";
import {
  HostListing as HostListingData,
  HostListingVariables
} from "../../lib/graphql/mutations/HostListing/__generated__/HostListing";

const {Content} = Layout;
const {Text, Title} = Typography;
const {Item} = Form;

interface Props {
  viewer: Viewer;
}

const beforeImageUpload = (file: File) => {
  //1. 对图片格式进行校验
  const fileIsValidImage = file.type === "image/jpeg" || file.type === "image/png";
  //2. 对图片大小进行校验
  const fileIsValidSize = file.size / 1024 / 1024 < 1;
  if (!fileIsValidImage) {
    displayErrorMessage("请检查图片格式，只支持PNG/JPG！");
    return false;
  }
  if (!fileIsValidSize) {
    displayErrorMessage(
      "图片大小超过1MB，请处理后再次上传！"
    );
    return false;
  }
  return fileIsValidImage && fileIsValidSize;
};
/**
 * 
 * 对图片进行Base64编码，成功后调用 callback并将编码后的结果传递到result中
 * 
 * @param img 需要编码的图片
 * @param callback 编码成功后的回调
 */
const getBase64Value = (
  img: File | Blob,
  callback: (imageBase64Value: string) => void
) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = () => {
    // 确定一定是字符串格式
    callback(reader.result as string);
  };
}

const Host = ({viewer, form}: Props & FormComponentProps) => {
  // 调用GraphQL mutation 发布房子
  const [hostListing, {loading, data}] = useMutation<HostListingData,
    HostListingVariables>(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("房子发布成功啦！正在帮你载入创建的豪宅信息中！");
    },
    onError: (e) => {
      console.log(e)
      displayErrorMessage(
        "创建失败！请稍后再试！"
      );
    }
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
  const {getFieldDecorator} = form;
  /**
   * - 上传文件时 跟进当前状态：uploading 以及 done 
   *    * 根据不同状态 刷新imageLoading，以便展示加载状态
   * 
   * - 将图片进行base64 编码后，存入到imageBase64Value中
   * 
   * @param info 图片内容
   */
  const handleImageUpload = (info: UploadChangeParam) => {
    const {file} = info;
    if (file.status === "uploading") {
      setImageLoading(true);
      return;
    }
    if (file.status === "done" && file.originFileObj) {
      getBase64Value(file.originFileObj, imageBase64Value => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };
  const handleHostListing = async (evt: FormEvent) => {
    // 阻止默认行为，否则直接就提交表单了
    evt.preventDefault();

    form.validateFields((err, values) => {
      if (err) {
        displayErrorMessage("请检查您填写的表单数据");
        return;
      }
      // 组装数据 调用Mutation 发布
      const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;
      const input = {
        ...values,
        address: fullAddress,
        image: imageBase64Value,
        price: values.price * 100
      };
      delete input.city;
      delete input.state;
      delete input.postalCode;
      hostListing({
        variables: {
          input
        }
      });
    });
  };
  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            请等候
          </Title>
          <Text type="secondary">正在创建您的提交哈！稍等！</Text>
        </div>
      </Content>
    );
  }
  // 创建成功后跳转到listing界面
  // 此处的data 是mutation的结果
  if (data && data.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }
  // 验证用户状态
  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            抱歉，您必须登录google和Stripe账号
          </Title>
          <Text type="secondary">
            我们只允许登录google账号同时授权了Stripe的用户发布租赁信息
            <Link to="/login">/login</Link> 在这里您可以进行登录操作
          </Text>
        </div>
      </Content>
    );
  }

  return (
    <Content className="host-content">
      {/* 
      
      antd form组件需要校验字段时：

      需要通过 getFieldDecorator 函数将校验规则 以及渲染组件传递进去
      
      
      */}
      <Form layout="vertical" onSubmit={handleHostListing}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi 在这里填写你要发布的信息
          </Title>
          <Text type="secondary">
            在这个表格中，我们需要收集一些关于你想出租房的一些内容
          </Text>
        </div>
        {/*房子类型*/}
        <Item label="选择您豪宅的类型">
          {getFieldDecorator("type", {
            rules: [
              {
                required: true,
                message: "请为您的豪宅选一个类型"
              }
            ]
          })(
            <Radio.Group>
              <Radio.Button value={ListingType.APARTMENT}>
                <Icon type="bank" style={{color: iconColor}}/> <span>公寓</span>
              </Radio.Button>
              <Radio.Button value={ListingType.HOUSE}>
                <Icon type="home" style={{color: iconColor}}/> <span>民宿</span>
              </Radio.Button>
            </Radio.Group>
          )}
        </Item>
        {/*豪宅名称*/}
        <Item label="Title" extra="最长不超过45个字符">
          {getFieldDecorator("title", {
            rules: [
              {
                required: true,
                message: "输入您豪宅的名称！"
              }
            ]
          })(<Input maxLength={45} placeholder="！"/>)}
        </Item>
        {/*豪宅描述*/}
        <Item label="描述您的房子" extra="最长不能超过400个字符">
          {getFieldDecorator("description", {
            rules: [
              {
                required: true,
                message: "请对您的豪宅进行描述！"
              }
            ]
          })(
            <Input.TextArea
              rows={3}
              maxLength={400}
              placeholder="现代的、干净的、温暖的 ... 位于... 的某一座豪宅"
            />
          )}
        </Item>
        {/*街道*/}
        <Item label="区/街道/门牌号">
          {getFieldDecorator("address", {
            rules: [
              {
                required: true,
                message: "Please enter an address for your listing!"
              }
            ]
          })(<Input placeholder="小店区/许坦东街/8652豪宅"/>)}
        </Item>
        <Item label="城市">
          {getFieldDecorator("city", {
            rules: [
              {
                required: true,
                message: "请填写您的城市信息"
              }
            ]
          })(<Input placeholder="太原"/>)}
        </Item>

        <Item label="省份">
          {getFieldDecorator("state", {
            rules: [
              {
                required: true,
                message: "请填写您的省份信息"
              }
            ]
          })(<Input placeholder="山西省"/>)}
        </Item>
        {/*邮编信息*/}
        <Item label="邮编">
          {getFieldDecorator("postalCode", {
            rules: [
              {
                required: true,
                message: "请输入您的邮编"
              }
            ]
          })(<Input placeholder="在这里输入您的豪宅邮编"/>)}
        </Item>
        {/*上传组件*/}
        <Item label="Image" extra="图片不能超过 1MB 并且只能是 JPG/PNG格式">
          <div className="host__form-image-upload">
            {getFieldDecorator("image", {
              rules: [
                {
                  required: true,
                  message: "Please enter provide an image for your listing!"
                }
              ]
            })(<Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64Value ? (
                <img src={imageBase64Value} alt="Listing"/>
              ) : (
                <div>
                  <Icon type={imageLoading ? "loading" : "plus"}/>
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>)}
          </div>
        </Item>
        <Item label="价钱" extra="统一按天处理">
          {getFieldDecorator("price", {
            rules: [
              {
                required: true,
                message: "Please enter a price for your listing!"
              }
            ]
          })(<InputNumber min={0} placeholder="120"/>)}
        </Item>
        {/*豪宅接受的人数*/}
        <Item label="最大入住旅客">
          {getFieldDecorator("numOfGuests", {
            rules: [
              {
                required: true,
                message: "Please enter the max number of guests!"
              }
            ]
          })(<InputNumber min={1} placeholder="4"/>)}
        </Item>
        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

// antD from 表单的高阶组件
export const WrappedHost = Form.create
  < Props & FormComponentProps > ({
    name: "host_form"
  })(Host);
