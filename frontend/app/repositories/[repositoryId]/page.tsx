"use client";

import dynamic from "next/dynamic";

const RepositoryDetail = dynamic(
  () => import("@/components/repository/repository-detail"),
  {
    ssr: false,
  },
);

export default function RepositoryDetailPage() {
  return <RepositoryDetail />;
}