using Microsoft.AspNetCore.Authorization;

namespace FourLoveRestaurant.Custom
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }
        public PermissionRequirement(string permission) => Permission = permission;

        public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
        {
            protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
            {
                // Buscamos entre los Claims del Token si existe alguno de tipo "Permission" 
                // cuyo valor coincida con el que pide el Controller.
                var permissions = context.User.FindAll("Permission").Select(x => x.Value);

                if (permissions.Contains(requirement.Permission))
                {
                    context.Succeed(requirement);
                }

                return Task.CompletedTask;
            }
        }


    }
}
