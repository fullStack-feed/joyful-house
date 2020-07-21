import React from "react";
import {Link} from "react-router-dom";
import {Card, Col, Input, Row, Typography} from "antd";

import torontoImage from "../../assets/toronto.jpg";
import dubaiImage from "../../assets/dubai.jpg";
import losAngelesImage from "../../assets/los-angeles.jpg";
import londonImage from "../../assets/london.jpg";


const {Title} = Typography;
const {Search} = Input;

interface Props {
  onSearch: (value: string) => void
}

export const HomeHero = ({onSearch}: Props) => {
  return (
    <div className="home-hero">
      <div className="home-hero__search">
        <Title className="home-hero__title">Find a place you'll love to stay at</Title>
        <Search
          placeholder="Search 'San Fransisco'"
          size="large"
          enterButton className="home-hero__search-input"
          onSearch={onSearch}
        />
      </div>
      {/*TODO: Row 网格布局分配*/}
      <Row gutter={12} className="home-hero__cards">
        <Col xs={12} md={6}>
          <Link to="/listings/toronto">
            <Card cover={<img alt="toronto" src={torontoImage}/>}>Toronto</Card>
          </Link>
        </Col>
        <Col xs={12} md={6}>
          <Link to="/listings/dubai">
            <Card cover={<img alt="dubai" src={dubaiImage}/>}>Dubai</Card>
          </Link>
        </Col>
        <Col xs={0} md={6}>
          <Link to="/listings/los%20angeles">
            <Card cover={<img alt="los-angeles" src={losAngelesImage}/>}>Los Angeles</Card>
          </Link>
        </Col>
        <Link to="/listings/london">
          <Col xs={0} md={6}>
            <Card cover={<img alt="london" src={londonImage}/>}>London</Card>
          </Col>
        </Link>
      </Row>
    </div>
  );
}
