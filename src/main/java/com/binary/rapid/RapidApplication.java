package com.binary.rapid;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

<<<<<<< HEAD
@SpringBootApplication(exclude = {
        DataSourceAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})

=======
@SpringBootApplication
@MapperScan("com.binary.rapid.shop.mapper")
>>>>>>> c4f815a4303b77dab27892e0793a037cbba6de73
public class RapidApplication {

    public static void main(String[] args) {
        SpringApplication.run(RapidApplication.class, args);
    }


}
