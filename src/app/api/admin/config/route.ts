import { NextResponse, NextRequest } from "next/server";
import ConfigModule from "@/models/configModel.js"
import UserModule from "@/models/userModel.js"
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";

const Config = ConfigModule as any;
const User = UserModule as any;
connect();

export async function GET() {
    try {
        let config = await Config.findOne({ configId: 'global' });
        
        if (!config) {
            // Initialize config if it doesn't exist
            config = await Config.create({ configId: 'global' });
        }

        return NextResponse.json({ config }, { status: 200 });

    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching configuration', error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }

        const user = await User.findById(userId).select("isAdmin");
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: "Forbidden: Not an admin" }, { status: 403 });
        }

        const body = await request.json();
        const { heroTitle, heroSubtitle, aboutSummary, aboutBioLong, authorImageUrl } = body;

        const updateData: any = {
            heroTitle,
            heroSubtitle,
            aboutSummary,
            aboutBioLong,
            authorImageUrl,
        };

        const updatedConfig = await Config.findOneAndUpdate(
            { configId: 'global' },
            updateData,
            { new: true, upsert: true, runValidators: true } 
        );

        return NextResponse.json(
            {
                message: 'Configuration updated successfully.',
                config: updatedConfig
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during config update:', error);
        return NextResponse.json(
            { message: 'Failed to update configuration.', error: (error as Error).message },
            { status: 500 }
        );
    }
}