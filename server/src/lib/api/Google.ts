import {google} from "googleapis";
import {
  Client,
  AddressComponent,
  AddressType,
  GeocodingAddressComponentType,
} from "@googlemaps/google-maps-services-js";

const maps = new Client({});
const parseAddress = (addressComponents: AddressComponent[]) => {
  let country = null;
  let admin = null;
  let city = null;

  for (const component of addressComponents) {
    if (component.types.includes(AddressType.country)) {
      country = component.long_name;
    }
    if (component.types.includes(AddressType.administrative_area_level_1)) {
      admin = component.long_name;
    }
    if (
      component.types.includes(AddressType.locality) ||
      component.types.includes(GeocodingAddressComponentType.postal_town)
    ) {
      city = component.long_name;
    }
  }
  return { country, admin, city };
};
const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);

export const Google = {
  geocode: async (address: string) => {
    if (!process.env.G_GEOCODE_KEY) throw new Error("missing Google Maps API key");

    const res = await maps.geocode({
      params: { address, key: process.env.G_GEOCODE_KEY },
    });

    if (res.status < 200 || res.status > 299) {
      throw new Error("failed to geocode address");
    }
    console.log(res.data);
    return parseAddress(res.data.results[0].address_components);
  },
  authUrl: auth.generateAuthUrl({
    // eslint-disable-next-line @typescript-eslint/camelcase
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  }),
  /**
   * 登录功能，返回user信息
   */
  logIn: async (code: string) => {
    console.log(`开始OAuth登录认证流程，用户输入的code为：${code}`);
    const {tokens} = await auth.getToken(code);
    auth.setCredentials(tokens);
    console.log(
      `通过google 获取的tokens 为${tokens},开始向google 发起第二次请求,不知道这次是做什么...`
    );
    const {data} = await google.people({version: "v1", auth}).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    });
    return {user: data};
  },
};

