using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Configuration;
using Angular_Upload.Models;
using Angular_Upload.Models.Enum;

namespace Angular_Upload.Services
{
    public interface IFileHandler
    {
        FileInfo[] GetFiles(string path, SearchOption option);
        DirectoryInfo[] GetDirectories(string path, SearchOption option);

        long DirectorySize(DirectoryInfo dInfo, bool includeSubDir);

        bool IsFolderExists(string folderPath);
        bool IsFolderExists(string rootFolder, string subFolder);
        bool IsFileExists(string filePath);

        bool CreateFolder(string rootPath, string folderName);
        bool CreateFolder(string workingPath);

        bool Delete(string filePath, FileType filetype);

        string MimeType(string Filename);
    }

    public class FileHandler : IFileHandler
    {
        public FileHandler()
        {

        }

        public bool IsFolderExists(string folderPath)
        {
            return Directory.Exists(folderPath);
        }

        public bool IsFolderExists(string rootFolder, string subFolder)
        {
            return Directory.Exists(Path.Combine(rootFolder, subFolder));
        }

        public bool IsFileExists(string filePath)
        {            
            return File.Exists(filePath);
        }

        public long DirectorySize(DirectoryInfo dInfo, bool includeSubDir)
        {
            // Enumerate all the files
            long totalSize = dInfo.EnumerateFiles().Sum(file => file.Length);

            // If Subdirectories are to be included
            if (includeSubDir)
            {
                // Enumerate all sub-directories
                totalSize += dInfo.EnumerateDirectories().Sum(dir => DirectorySize(dir, true));
            }
            return totalSize;
        }

        public bool CreateFolder(string workingPath)
        {
            try
            {
                Directory.CreateDirectory(workingPath);

                return true;
            }
            catch (System.IO.IOException ex)
            {
                return false;
            }
        }

        public bool CreateFolder(string rootPath, string folderName)
        {
            try
            {
                Directory.CreateDirectory(Path.Combine(rootPath, folderName));

                return true;
            }
            catch (System.IO.IOException ex)
            {
                return false;
            }
        }

        public string MimeType(string Filename)
        {
            string mime = "application/octetstream";
            string ext = System.IO.Path.GetExtension(Filename).ToLower();
            Microsoft.Win32.RegistryKey rk = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (rk != null && rk.GetValue("Content Type") != null)
                mime = rk.GetValue("Content Type").ToString();
            return mime;
        }

        public bool Delete(string filePath, FileType filetype)
        {
            try
            {
                if (filetype == FileType.dir)
                {
                    System.IO.Directory.Delete(filePath, true);
                }

                if (filetype == FileType.file)
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (SystemException ex)
            {
                return false;
            }

            return true;
        }


        public FileInfo[] GetFiles(string path, SearchOption option)
        {            
            DirectoryInfo dir = new DirectoryInfo(path);

            if (dir.Exists)
            {
                return dir.GetFiles("*.*", option);
            }

            return null;
        }

        public DirectoryInfo[] GetDirectories(string path, SearchOption option)
        {
            DirectoryInfo dir = new DirectoryInfo(path);

            if (dir.Exists)
            {
                return dir.GetDirectories();
            }

            return null;
        }
    }
}