import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  `${process.env.PUBLIC_URL}/login`
);
export const Google = {
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
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);
    console.log(
      `通过google 获取的tokens 为${tokens},开始向google 发起第二次请求,不知道这次是做什么...`
    );
    const { data } = await google.people({ version: "v1", auth }).people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    });
    return { user: data };
  },
};
