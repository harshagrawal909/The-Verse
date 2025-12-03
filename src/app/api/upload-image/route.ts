import {put} from "@vercel/blob"
import {NextResponse,NextRequest} from "next/server"

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('coverFile') as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ message: 'No file uploaded or file is empty.' }, { status: 400 });
    }

    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const blob = await put(uniqueFileName, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ 
        message: 'File uploaded successfully', 
        url: blob.url,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Vercel Blob Upload Error:', error);
    return NextResponse.json({ message: 'Internal Server Error during file upload.' }, { status: 500 });
  }
}