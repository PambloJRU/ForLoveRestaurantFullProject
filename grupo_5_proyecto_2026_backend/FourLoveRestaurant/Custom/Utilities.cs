using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FourLoveRestaurant.Models;
using FourLoveRestaurant.Repository;
using Microsoft.EntityFrameworkCore;


namespace FourLoveRestaurant.Custom
{
    public class Utilities
    {
        private readonly IConfiguration _configuration;
        private readonly ForLoveDBContext _forLoveDBContext;
        public Utilities(IConfiguration configuration, ForLoveDBContext forLoveDBContext)
        {

            _configuration = configuration;
            _forLoveDBContext = forLoveDBContext;

        }

        public string encryptSHA256(string text)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(text));

                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();

            }
        }

        public async Task<string> generateJWT(User user)
        {
        var permissions = await _forLoveDBContext.Rols
           .Where(r => r.Id == user.IdRol)
           .SelectMany(r => r.IdPermissions)
           .Select(p => p.Name)
           .ToListAsync();

            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                // se agrega rol (opcional)
                new Claim(ClaimTypes.Role, user.IdRolNavigation?.Name ?? "Sin Rol")

            };

            foreach (var permissionName in permissions)
            {
                userClaims.Add(new Claim("Permission", permissionName));
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:key"]!));
            var credentials = new SigningCredentials(securityKey,SecurityAlgorithms.HmacSha256Signature);

            //detalle del token
            var jwtConfig = new JwtSecurityToken(

                claims: userClaims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
                );

            return new JwtSecurityTokenHandler().WriteToken(jwtConfig);
        }
    }
}
