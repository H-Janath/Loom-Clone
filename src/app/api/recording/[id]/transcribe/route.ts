import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function  POST(req: NextRequest,{params}:{params:{id:string}}) {
    try {
        const body = await req.json();
        const {id} = params;
        const content = JSON.parse(body.content)

        const transcribe = await client.video.update({
            where:{
                userId: id,
                source: body.filename
            },
            data: {
                title: content.title,
                description: content.summary,
                summery: body.transcript,
            }
        })
        if(transcribe){
            console.log("Transcription saved successfully");
            return NextResponse.json({status:200 })
        }
    } catch (error) {
        
    }
}