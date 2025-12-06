import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
      cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY,  
      api_secret: process.env.CLOUDINARY_API_SECRET,   
  });


const uploadOnCloudinary=async(logcalFilePath)=>{
  
   try {
      if(!logcalFilePath) return null;
     const response=await cloudinary.uploader.upload(logcalFilePath,{
        resource_type:'auto'
     })
     console.log('File is uploaded on Cloudinary ', response)
     fs.unlinkSync(logcalFilePath);
     return response
   } catch (error) {
      fs.unlinkSync(logcalFilePath);//remove the local save temporary file as the upload operation got failed
      return;
   }
}

// const deleteOnCloudinary=async(logcalFilePath)=>{
//      if(!logcalFilePath) return null;
//      try {
//           const parts = logcalFilePath.split("/");
//           const file = parts[parts.length - 1];       // "jv3veaf1uktxf1lh4ewd.jpg"
//           const publicId = file.split(".")[0]; 
//          const response=await cloudinary.uploader.destroy(publicId, {
//             resource_type:'auto'
//          });
//          console.log('Deleted from Cloudinary:',response);
//          return response;
//      } catch (error) {
//         console.error('Cloudinary delete failed:', error);
//         throw error;
//      }
// }

// Accepts either public_id or a full Cloudinary URL and infers resource_type
const deleteOnCloudinary=async(identifier)=>{
       if(!identifier) return null;
       try {
             let publicId = identifier;
             let resourceType = 'image';

             // If a URL is provided, parse the public_id and resource type by extension
             if (/^https?:\/\//.test(identifier)) {
                const url = new URL(identifier);
                const pathname = url.pathname; // /<version>/.../<public_id>.<ext>
                const lastSegment = pathname.split('/').pop() || '';
                const dotIdx = lastSegment.lastIndexOf('.');
                const ext = dotIdx !== -1 ? lastSegment.slice(dotIdx + 1).toLowerCase() : '';
                // Determine resource type by extension
                if (["mp4","mov","webm","mkv"].includes(ext)) resourceType = 'video';
                else if (["js","css"].includes(ext)) resourceType = 'raw';
                else resourceType = 'image';

                // public_id is the path without extension and without leading folders after /upload/
                // Typical URL: /<cloud_name>/<resource_type>/upload/v12345/folder/name/public_id.ext
                // We can remove extension from last segment and keep the path from after '/upload/'
                const parts = pathname.split('/');
                const uploadIndex = parts.findIndex(p => p === 'upload');
                if (uploadIndex !== -1) {
                   const idParts = parts.slice(uploadIndex + 2); // skip 'upload' and version 'v12345'
                   if (idParts.length) {
                      idParts[idParts.length - 1] = dotIdx !== -1 ? lastSegment.slice(0, dotIdx) : lastSegment;
                      publicId = idParts.join('/');
                   }
                } else {
                   // Fallback: strip extension only
                   publicId = dotIdx !== -1 ? lastSegment.slice(0, dotIdx) : lastSegment;
                }
             }

             const response = await cloudinary.uploader.destroy(publicId, {
                  resource_type: resourceType
             });
             console.log('Deleted from Cloudinary:',response);
             return response;
       } catch (error) {
            console.error('Cloudinary delete failed:', error);
            throw error;
       }
}


export {uploadOnCloudinary,deleteOnCloudinary}


// cloudinary.v2.uploader
// .upload("dog.mp4", {
//   resource_type: "video", 
//   public_id: "my_dog",
//   overwrite: true, 
//   notification_url: "https://mysite.example.com/notify_endpoint"})
// .then(result=>console.log(result));