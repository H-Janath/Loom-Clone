'use server'

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server"

export const verifyAccessToWorkspace= async(workspaceId:string)=>{
    try {
        const user = await currentUser();
        if(!user) return{status: 403}
        const isUserInWorkspace = await client.workSpace.findUnique({
            where:{
                id: workspaceId,
                OR: [
                    {
                        User:{
                            clerkid: user.id,
                        },
                    },
                    {
                        members:{
                            every:{
                                User:{
                                    clerkid: user.id,
                                },
                            },
                        },
                    },
                ],
            },
        })
        return{
            status: 200,
            data: {workspace: isUserInWorkspace }
        }
    } catch (error) {
        return{
            status: 403,
            data: {workspace: null}
        }
    }
}

export const getWorkspaceFolders = async (workSpaceId: string) => {
    try {
      const isFolders = await client.folder.findMany({
        where: {
          workSpaceId,
        },
        include: {
          _count: {
            select: {
              videos: true,
            },
          },
        },
      })
      if (isFolders && isFolders.length > 0) {
        return { status: 200, data: isFolders }
      }
    console.log(isFolders)
      return { status: 404, data: [] }
    } catch (error) {
      return { status: 403, data: [] }
    }
  }

export const getAllUserVideos = async(workSpaceId: string)=>{
    try {
        const user = await currentUser()
        if(!user) return {status: 404}
        const videos = await client.video.findMany({
            where:{
                OR:[{workSpaceId},{folderId:workSpaceId}],
            },
            select:{
                id:true,
                title: true,
                createdAt: true,
                source:true,
                processing:true,
                Folder:{
                    select:{
                        id:true,
                        name: true,
                    },
                },
                User:{
                    select:{
                        firstname: true,
                        lastname: true,
                        image: true
                    },
                },
            },
            orderBy:{
                createdAt: 'asc',
            },
        })
       
        if(videos && videos.length>0){
            return {
                statu: 200, data: videos
            }
        }
        return {status:404 }
    } catch (error) {
        return {status: 400}
    }
}

export const getWorksPaces = async ()=>{
    try {
        const user = await currentUser();
        if(!user) return {status: 404}
        const workSpace = await client.user.findUnique({
            where:{
                clerkid: user.id,
            },
            select: {
                subscription:{
                    select:{
                        plan:true,
                    },
                },
                workspace:{
                    select:{
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                members: {
                    select: {
                        WorkSpace:{
                            select:{
                                id:true,
                                name:true,
                                type: true,
                            }
                        }
                    }
                }
            }
        })
      
        if(workSpace){
            return {status: 200, data: workSpace}
        }
    } catch (error) {
        return { status: 400}
    }
} 

export const getNotifications = async()=>{
    try {
        const user = await currentUser()
        if(!user) return {status:404 }
        const notifcation = await client.user.findUnique({
            where: {
                clerkid: user.id,
            },
            select: {
                notification: true,
                _count:{select:{
                    notification:true
                },
              },
            },
        })
        if(notifcation && notifcation.notification.length>0) 
            return {status:200, data:notifcation}
        return {status: 400, data:[]}
    } catch (error) {
        return {status: 400, data: []}
    }
}

export const createWorkspace = async(name:string) => {
    try {
        const user = await currentUser()
        if(!user) return {status: 404}
        const authorzed = await client.user.findUnique({
            where:{
                clerkid: user.id,
            },
            select:{
                subscription:{
                    select:{
                        plan:true,
                    }
                }
            }
        })

        if(authorzed?.subscription?.plan === "PRO"){
            const workspace = await client.user.update({
                where:{
                    clerkid: user.id,
                },
                data: {
                    workspace:{
                        create:{
                            name,
                            type: "PUBLIC"
                        }
                    }
                }
            })
            if(workspace){
                return {status: 201, data: "Workspace created"}
            }
        }
       return {status:401, data: "You are not authorized to create a workspace"}
    } catch (error) {
        return {status: 400}
    }
}

export const renameFolders = async (folderId: string, name: string)=>{
    try {
        const folder = await client.folder.update({
            where: {
                id: folderId,
            },
            data:{
                name,
            }
        })
        if(folder){return {status: 200, data: "Folder renames"}}
        return {status: 400, data:'Folder does not exit'}
    } catch (error) {
        return {status: 500, data:'Opps! something went wrong'}
    }
}

export const createFolder = async(workSpaceId:string)=>{
    try {
        const isNewFolder = await client.workSpace.update({
            where:{
                id:workSpaceId
            },
            data:{
                folders:{
                    create:{name:'Untitled'},
                },
            },
        })
        if(isNewFolder){
            return {status:200 , message:"New Folder Created"}
        }
    } catch (error) {
        return {status: 200, message:"Oppse something went wrong"}
    }
}

export const getFolderInfo =async (folderId: string) =>{
    try {
        const folder = await client.folder.findUnique({
            where:{
                id:folderId,
            },
            select:{
                name:true,
                _count:{
                    select:{
                        videos:true
                    },
                },
            },
        })
        if(folder) return{
            status: 200, data:folder
        }
        return{
            status: 400,
            data: null
        }
    } catch (error) {
        return{
            status: 500,
            data: null
        }
    }
}