CREATE TABLE IF NOT EXISTS `locations`(
    `id` INT UNSIGNED AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `rule_id` VARCHAR(100) NOT NULL, -- from twitter stream rule
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `users`(
    `id` INT UNSIGNED AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(100) NOT NULL,
    `location_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`)
);

CREATE TABLE IF NOT EXISTS `suicidals`(
    `id` INT UNSIGNED AUTO_INCREMENT,
    `twitter_username` VARCHAR(100) NOT NULL,
    `twitter_text` VARCHAR(100) NOT NULL,
    `twitter_created_at` TIMESTAMP NOT NULL,
    `location_id` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`)
);
