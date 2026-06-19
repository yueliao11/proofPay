import SettlementDetailPage from "./SettlementDetailPage";

export default function Page() {
  return <SettlementDetailPage />;
}

export function generateStaticParams() {
  return [{ id: "demo" }];
}
