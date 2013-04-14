using System.Web;
using System.Web.Mvc;

namespace SoftwareCraftsmen.Blog.UI.Web.Blog
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}