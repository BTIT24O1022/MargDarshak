import { C } from "../constants";
import { Card } from "../components/common";

export default function ComingSoon({ title }) {
  return (
    <Card style={{ textAlign:"center",padding:60 }}>
      <div style={{ fontSize:44,marginBottom:14 }}>🚧</div>
      <div style={{ fontFamily:"monospace",fontSize:17,fontWeight:800,color:C.text,marginBottom:7 }}>{title}</div>
      <div style={{ fontFamily:"monospace",fontSize:11,color:C.muted }}>Under construction — coming soon!</div>
    </Card>
  );
}