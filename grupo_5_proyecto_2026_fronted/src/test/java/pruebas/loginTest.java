import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;
import org.junit.jupiter.api.Test;

public class LoginTest {

    @Test
    public void loginCorrecto() {
        System.setProperty("webdriver.chrome.driver", "ruta/chromedriver.exe");
        WebDriver driver = new ChromeDriver();

        driver.get("http://localhost:8080/login");

        driver.findElement(By.name("name")).sendKeys("admin");
        driver.findElement(By.name("password")).sendKeys("admin");

        driver.findElement(By.tagName("button")).click();

        
        assert driver.getCurrentUrl().equals("http://localhost:8080/");

        driver.quit();
    }
}
