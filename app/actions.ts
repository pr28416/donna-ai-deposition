"use server";
import { QueryText, QueryVideo } from "@/lib/utils";

export async function getTimestamps(query: QueryVideo) {
  const response = await fetch("http://localhost:80/query_video/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  return response.json();
}

export async function searchTimestamp(query: QueryText) {
  const response = await fetch("http://localhost:80/query_text/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  return response.json();
}
