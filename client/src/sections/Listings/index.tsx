import React, {useState,useEffect,useRef} from "react";
import {RouteComponentProps} from 'react-router-dom'
import {useQuery} from "@apollo/react-hooks";
import {Affix, Layout, List, Typography} from "antd";
import {LISTINGS} from "../../lib/graphql/queries";
import {Listings as ListingsData, ListingsVariables} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import {ListingsFilter} from "../../lib/graphql/globalTypes";
import {ErrorBanner,ListingCard} from "../../lib/components";
import {ListingsFilters, ListingsPagination,ListingsSkeleton} from "./components";

//TODO:
/**
 * 1. 获取 region
 * 2. query with no data
 * 3. 后端对 错误的listings 查询没有做处理？
 */

const {Content} = Layout;
const PAGE_LIMIT = 8;

// 用于校验路由参数
interface MatchParams {
  location: string
}

export const Listings = ({match}: RouteComponentProps<MatchParams>) => {
  const [filter, setFilter] = useState(ListingsFilter.PRICE_LOW_TO_HIGH);
  const locationRef = useRef(match.params.location);
  // 用于分页功能的 hooks
  const [page, setPage] = useState(1);
  // 当 location 发生改变后，需要将 page 归位 到 1
  useEffect(() => {
    setPage(1);
  }, [match.params.location]);
  const {data,loading,error} = useQuery<ListingsData, ListingsVariables>(LISTINGS, {
    skip: locationRef.current !== match.params.location && page !== 1
    ,variables: {
      location: match.params.location,
      filter: filter,
      limit: PAGE_LIMIT,
      page: page
    }
  })
  if(loading) {
    return <Content className="listings">
      <ListingsSkeleton/>
    </Content>
  }
  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="We either couldn't find anything matching your search or have encountered an error. If you're searching for a unique location, try searching again with more common keywords." />
        <ListingsSkeleton />
      </Content>
    );
  }
  const listings = data ? data.listings : null;
  const listingsSectionElement = listings ? (
    <div>
      <ListingsPagination
        total={listings.total}
        page={page}
        limit={PAGE_LIMIT}
        setPage={setPage}/>
      <ListingsFilters
        filter={filter}
        setFilter={setFilter}
      />
      <List
        grid={{
          gutter: 8,
          xs: 1,
          sm: 2,
          lg: 4
        }}
        dataSource={listings.result}
        renderItem={listing => (
          <List.Item>
            <ListingCard listing={listing}/>
          </List.Item>
        )}
      />
    </div>
  ) : null;
  return <Content className="listings">{listingsSectionElement}</Content>;
};
