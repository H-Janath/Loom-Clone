import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req:NextRequest,
    {params}:{params: {id:string}}
 ) {
    const body = await req.json();
    const {id} = params;

    const complereProcessing = await client.video.update({
        where:{
            userId: id,
            source: body.filename,
        },
        data:{
            processing: false,
        }
    })
    if(complereProcessing){
        return NextResponse.json({status: 200})
    }

    return NextResponse.json({status:500})
    
}