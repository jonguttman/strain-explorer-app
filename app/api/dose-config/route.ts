import { NextResponse } from "next/server";
import { getDoseConfig } from "@/data/strainData";

export async function GET() {
  const { order, config } = getDoseConfig();

  return NextResponse.json({
    order,
    config,
  });
}

