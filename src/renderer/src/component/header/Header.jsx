import Connection from "./Connection";
import Query from "./Query";
import { Space } from 'antd';
const Header = () => (
  <div style={{marginBottom:10}}>
    <Space>
      <Connection></Connection>
      {/* <Query></Query> */}
    </Space>
  </div>
);
export default Header;