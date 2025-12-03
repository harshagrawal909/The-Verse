import { NextResponse,NextRequest } from "next/server";
import Story from "@/models/storyModel.js"
import { connect } from "@/dbConfig/dbConfig";


export async function POST(request:NextRequest){
    try {
        await connect()

        const body = await request.json();
        const { 
            title, 
            description, 
            content,     
            category,    
            coverImage, 
            tags, 
            isPublished,
            isFeatured  ,
            isSeries,
            seriesName 
        } = body;

        if (!title || !description || !content  || !coverImage) {
            return NextResponse.json(
                { message: 'Missing required fields: title, summary, content, category, or cover image URL.' },
                { status: 400 }
            );
        }

        if (isSeries && (!seriesName || seriesName.trim() === "")) {
             return NextResponse.json(
                { message: 'Series Name is required if the story is part of a series.' },
                { status: 400 }
            );
        }

        const newStory = await Story.create({
            title,
            description, 
            content,     
            category,
            coverImage,
            tags: tags || [],
            isPublished: isPublished || false,
            isFeatured: isFeatured || false,
            isSeries: isSeries || false,
            seriesName: isSeries ? seriesName : undefined
        });

        return NextResponse.json(
            { 
                message: 'Story created successfully.', 
                story: newStory
            },
            { status: 201 }
        );


    } catch (error) {
        console.error('API Error during story creation:', error);

        let errorMessage = 'Internal Server Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { message: 'Failed to create story.', error: errorMessage },
            { status: 500 }
        );
    }
}