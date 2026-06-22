namespace MiniGitApplication.Options
{
    public class FolderOptions
    {
        public const string SectionName = "FolderOptions";

        /// <summary>Absolute or relative path where JSON snapshots are stored.</summary>
        public string StoragePath { get; set; } = "data";
    }
}
