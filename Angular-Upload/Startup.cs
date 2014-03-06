using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Angular_Upload.Startup))]
namespace Angular_Upload
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
