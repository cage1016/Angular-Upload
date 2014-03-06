using Angular_Upload.Models;
using Angular_Upload.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace Angular_Upload.Controllers
{
    public class FileController : Controller
    {
        IFileService service;

        public FileController()
        {
            service = new FileService();
        }

        //
        // GET: /File/Upload
        [HttpPost]
        public ActionResult Upload()
        {
            var fileData = new List<ViewDataUploadFilesResult>();

            foreach (string file in Request.Files)
            {                
                service.Upload(Request, fileData);
            }

            var serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = Int32.MaxValue;

            var result = new ContentResult
            {
                Content = "{\"files\":" + serializer.Serialize(fileData) + "}",
            };

            if (fileData.Any(x => !string.IsNullOrEmpty(x.error)))
                Response.StatusCode = 500;

            return result;
        }
	}
}