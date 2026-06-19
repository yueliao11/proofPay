import ReviewerPage from "./ReviewerPage";

export default function Page() {
  return <ReviewerPage />;
}

export function generateStaticParams() {
  return [{ id: "demo" }];
}
