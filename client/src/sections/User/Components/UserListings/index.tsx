import React from "react";
import {List, Typography} from "antd";
import {ListingCard} from "../../../../lib/components";
import {User} from "../../../../lib/graphql/queries/User/__generated__/User";

interface Props {
  userListings: User["user"]["listings"];
  listingsPage: number;
  limit: number;
  setListingsPage: (page: number) => void;
}

const {Paragraph, Title} = Typography;

export const UserListings =
  ({
     userListings,
     listingsPage,
     limit,
     setListingsPage
   }: Props) => {
    const {total, result} = userListings;

    const userListingsList = (
      <List
        grid={{
          gutter: 8,
          xs: 1,
          sm: 2,
          lg: 4
        }}
        dataSource={result}
        locale={{emptyText: "用户没有任何发布的房产！"}}
        pagination={{
          position: "top",
          current: listingsPage,
          total,
          defaultPageSize: limit,
          hideOnSinglePage: true,
          showLessItems: true,
          onChange: (page: number) => setListingsPage(page)
        }}
        renderItem={userListing => (
          <List.Item>
            <ListingCard listing={userListing}/>
          </List.Item>
        )}
      />
    );

    return (
      <div className="user-listings">
        <Title level={4} className="user-listings__title">
          发布
        </Title>
        <Paragraph className="user-listings__description">
        展示了该用户当前托管并可供预订的House
        </Paragraph>
        {userListingsList}
      </div>
    );
  };
