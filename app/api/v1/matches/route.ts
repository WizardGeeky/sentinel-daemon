import { NextResponse } from "next/server";
import { getMatches } from "@/daemon/store";

export async function GET() {
    try {
        const matches = getMatches(50);
        return NextResponse.json({ matches });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
    }
}
