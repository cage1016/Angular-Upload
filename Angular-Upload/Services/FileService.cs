using Angular_Upload.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace Angular_Upload.Services
{
    public interface IFileService {
        void Upload(HttpRequestBase Request, List<ViewDataUploadFilesResult> statuses);
    }

    public class FileService:IFileService
    {
        private readonly string _rootDirctory;
        private FileHandler fileHandler;

        public FileService()
        {
            _rootDirctory = HttpContext.Current.Server.MapPath("~/Files");
            fileHandler = new FileHandler();
        }

        public void Upload(HttpRequestBase Request, List<ViewDataUploadFilesResult> statuses)
        {
            // 檢查使用者主目錄 root folder
            string homePath = Path.Combine(_rootDirctory);
            if (!fileHandler.IsFolderExists(homePath))
                fileHandler.CreateFolder(homePath);

            // 3. 上傳檔案            
            foreach (string file in Request.Files)
            {
                HttpPostedFileBase hpf = Request.Files[file] as HttpPostedFileBase;
                if (hpf.ContentLength == 0)
                    continue;

                // upload file to DressPhotos folder
                string nsfile = Path.Combine(homePath, Path.GetFileName(hpf.FileName));
                hpf.SaveAs(nsfile);
                string errorMsg = string.Empty;

                statuses.Add(new ViewDataUploadFilesResult()
                {
                    //url = "/Files/" + fileId + "/" + fileNameEncoded,
                    //thumbnail_url = "/Files/" + fileId + "/" + fileNameEncoded, //@"data:image/png;base64," + EncodeFile(fullName),
                    name = Path.GetFileName(nsfile),
                    type = hpf.ContentType,
                    size = hpf.ContentLength,
                    error = errorMsg
                    //delete_url = "/Files/" + fileId + "/" + fileNameEncoded,
                    //delete_type = "DELETE"
                });
            }   
        }
    }
}