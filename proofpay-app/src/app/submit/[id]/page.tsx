import SubmitDeliveryPage from "./SubmitDeliveryPage";

export default function Page() {
  return <SubmitDeliveryPage />;
}

export function generateStaticParams() {
  return [{ id: "demo" }];
}
