package com.binary.rapid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

<<<<<<< HEAD
@SpringBootApplication()
=======
@SpringBootApplication
>>>>>>> 83f4f60ba5406b4a618c5a8d4ce1aa47c4f8803b
public class RapidApplication {

    public static void main(String[] args) {
        SpringApplication.run(RapidApplication.class, args);
    }
    
}
