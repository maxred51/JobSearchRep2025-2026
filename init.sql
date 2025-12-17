-- MySQL Workbench Forward Engineering
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`administrator`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`administrator` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `imie` VARCHAR(50) NOT NULL,
  `nazwisko` VARCHAR(50) NOT NULL,
  `plec` ENUM('M', 'K') NOT NULL,
  `email` VARCHAR(50) NOT NULL UNIQUE,
  `haslo` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`kandydat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kandydat` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `imie` VARCHAR(50) NOT NULL,
  `nazwisko` VARCHAR(50) NOT NULL,
  `telefon` VARCHAR(12) NOT NULL UNIQUE,
  `email` VARCHAR(50) NOT NULL UNIQUE,
  `haslo` VARCHAR(255) NOT NULL,
  `plec` ENUM('M', 'K') NOT NULL,
  `cv_path` VARCHAR(255) NULL,
  `stan` ENUM('aktywny', 'zablokowany') NOT NULL DEFAULT 'aktywny',
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`kategoriapracy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kategoriapracy` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `Nazwa` VARCHAR(60) NOT NULL,
  `KategoriaPracyid` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kategoriapracy_nazwa` (`Nazwa`),
  CONSTRAINT `fk_KategoriaPracy_KategoriaPracy1`
    FOREIGN KEY (`KategoriaPracyid`)
    REFERENCES `mydb`.`kategoriapracy` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`firma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`firma` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(50) NOT NULL UNIQUE,
  `strona_www` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`pracownikHR`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`pracownikHR` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `imie` VARCHAR(50) NOT NULL,
  `nazwisko` VARCHAR(50) NOT NULL,
  `telefon` VARCHAR(12) NOT NULL UNIQUE,
  `email` VARCHAR(50) NOT NULL UNIQUE,
  `haslo` VARCHAR(255) NOT NULL,
  `plec` ENUM('M', 'K') NOT NULL,
  `Firmaid` INT(11) NOT NULL,
  `stan` ENUM('aktywny', 'zablokowany') NOT NULL DEFAULT 'aktywny',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_Pracodawca_Firma1`
    FOREIGN KEY (`Firmaid`)
    REFERENCES `mydb`.`firma` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`kategoriakandydata`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kategoriakandydata` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(60) NOT NULL,
  `PracownikHRid` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nazwa_pracownikhr` (`nazwa`, `PracownikHRid`),
  CONSTRAINT `fk_kategoriakandydata_pracownikHR`
    FOREIGN KEY (`PracownikHRid`)
    REFERENCES `mydb`.`pracownikHR` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`kandydat_kategoriakandydata`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`kandydat_kategoriakandydata` (
  `Kandydatid` INT NOT NULL,
  `KategoriaKandydataid` INT NOT NULL,
  PRIMARY KEY (`Kandydatid`, `KategoriaKandydataid`),
  CONSTRAINT `fk_kandydat_kategoriakandydata_kandydat`
    FOREIGN KEY (`Kandydatid`)
    REFERENCES `mydb`.`kandydat` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_kandydat_kategoriakandydata_kategoriakandydata`
    FOREIGN KEY (`KategoriaKandydataid`)
    REFERENCES `mydb`.`kategoriakandydata` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`oferta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`oferta` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tytul` VARCHAR(60) NOT NULL,
  `opis` VARCHAR(150) NOT NULL,
  `wynagrodzenie` DECIMAL(10,2) NOT NULL,
  `wymagania` TEXT NULL,
  `lokalizacja` VARCHAR(50) NOT NULL,
  `czas` INT(4) NOT NULL,
  `PracownikHRid` INT(11) NOT NULL,
  `KategoriaPracyid` INT(11) NOT NULL,
  `aktywna` BOOLEAN NOT NULL DEFAULT TRUE,
  `data` DATE NOT NULL DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_Oferta_KategoriaPracy1`
    FOREIGN KEY (`KategoriaPracyid`)
    REFERENCES `mydb`.`kategoriapracy` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferta_Pracodawca`
    FOREIGN KEY (`PracownikHRid`)
    REFERENCES `mydb`.`pracownikHR` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`zapisana_oferta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`zapisana_oferta` (
  `Kandydatid` INT(11) NOT NULL,
  `Ofertaid` INT(11) NOT NULL,
  PRIMARY KEY (`Kandydatid`, `Ofertaid`),
  CONSTRAINT `fk_ZapisanaOferta_Kandydat`
    FOREIGN KEY (`Kandydatid`)
    REFERENCES `mydb`.`kandydat` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ZapisanaOferta_Oferta`
    FOREIGN KEY (`Ofertaid`)
    REFERENCES `mydb`.`oferta` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`obserwowana_firma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`obserwowana_firma` (
  `Kandydatid` INT(11) NOT NULL,
  `Firmaid` INT(11) NOT NULL,
  PRIMARY KEY (`Kandydatid`, `Firmaid`),
  CONSTRAINT `fk_ObserwowanaFirma_Kandydat`
    FOREIGN KEY (`Kandydatid`)
    REFERENCES `mydb`.`kandydat` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ObserwowanaFirma_Firma`
    FOREIGN KEY (`Firmaid`)
    REFERENCES `mydb`.`firma` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`aplikacja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`aplikacja` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `status` ENUM('oczekujaca', 'odrzucona', 'zakceptowana') NOT NULL DEFAULT 'oczekujaca',
  `Kandydatid` INT(11) NOT NULL,
  `Ofertaid` INT(11) NOT NULL,
  `kwota` DECIMAL(10,2) NOT NULL,
  `odpowiedz` TEXT NOT NULL,
  `data_aplikacji` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_kandydat_oferta` (`Kandydatid`, `Ofertaid`),
  CONSTRAINT `fk_Aplikacja_Kandydat1`
    FOREIGN KEY (`Kandydatid`) REFERENCES `mydb`.`kandydat` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_Aplikacja_Oferta1`
    FOREIGN KEY (`Ofertaid`) REFERENCES `mydb`.`oferta` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`opinia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`opinia` (
  `Kandydatid` INT(11) NOT NULL,
  `Firmaid` INT(11) NOT NULL,
  `tresc` TEXT NOT NULL,
  PRIMARY KEY (`Kandydatid`, `Firmaid`),
  CONSTRAINT `fk_Opinia_Kandydat`
    FOREIGN KEY (`Kandydatid`)
    REFERENCES `mydb`.`kandydat` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Opinia_Firma`
    FOREIGN KEY (`Firmaid`)
    REFERENCES `mydb`.`firma` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`poziom`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`poziom` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`oferta_poziom`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`oferta_poziom` (
  `Ofertaid` INT(11) NOT NULL,
  `Poziomid` INT(11) NOT NULL,
  PRIMARY KEY (`Ofertaid`, `Poziomid`),
  CONSTRAINT `fk_Oferta_Poziom_Oferta1`
    FOREIGN KEY (`Ofertaid`)
    REFERENCES `mydb`.`oferta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferta_Poziom_Poziom1`
    FOREIGN KEY (`Poziomid`)
    REFERENCES `mydb`.`poziom` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`tryb`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tryb` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`oferta_tryb`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`oferta_tryb` (
  `Ofertaid` INT(11) NOT NULL,
  `Trybid` INT(11) NOT NULL,
  PRIMARY KEY (`Ofertaid`, `Trybid`),
  CONSTRAINT `fk_Oferta_Tryb_Oferta1`
    FOREIGN KEY (`Ofertaid`)
    REFERENCES `mydb`.`oferta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferta_Tryb_Tryb1`
    FOREIGN KEY (`Trybid`)
    REFERENCES `mydb`.`tryb` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`umowa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`umowa` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`oferta_umowa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`oferta_umowa` (
  `Ofertaid` INT(11) NOT NULL,
  `Umowaid` INT(11) NOT NULL,
  PRIMARY KEY (`Ofertaid`, `Umowaid`),
  CONSTRAINT `fk_Oferta_Umowa_Oferta1`
    FOREIGN KEY (`Ofertaid`)
    REFERENCES `mydb`.`oferta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferta_Umowa_Umowa1`
    FOREIGN KEY (`Umowaid`)
    REFERENCES `mydb`.`umowa` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`wymiar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`wymiar` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nazwa` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`oferta_wymiar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`oferta_wymiar` (
  `Ofertaid` INT(11) NOT NULL,
  `Wymiarid` INT(11) NOT NULL,
  PRIMARY KEY (`Ofertaid`, `Wymiarid`),
  CONSTRAINT `fk_Oferta_Wymiar_Oferta1`
    FOREIGN KEY (`Ofertaid`)
    REFERENCES `mydb`.`oferta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferta_Wymiar_Wymiar1`
    FOREIGN KEY (`Wymiarid`)
    REFERENCES `mydb`.`wymiar` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`wiadomosc`
-- -----------------------------------------------------
CREATE TABLE `mydb`.`wiadomosc` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nadawca_id INT NOT NULL,
  nadawca_typ ENUM('kandydat','pracownikHR','administrator') NOT NULL,
  odbiorca_id INT NOT NULL,
  odbiorca_typ ENUM('kandydat','pracownikHR','administrator') NOT NULL,
  tresc TEXT NOT NULL,
  przeczytane BOOLEAN DEFAULT FALSE,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`powiadomienie`
-- -----------------------------------------------------
CREATE TABLE `mydb`.`powiadomienie` ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  typ ENUM('oferta','system') NOT NULL, 
  tresc TEXT NOT NULL, 
  Kandydatid INT NULL, 
  Ofertaid INT NULL, 
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  przeczytane BOOLEAN DEFAULT FALSE, 
  FOREIGN KEY (Kandydatid) REFERENCES kandydat(id) ON DELETE CASCADE, 
  FOREIGN KEY (Ofertaid) REFERENCES oferta(id) ON DELETE CASCADE 
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `mydb`.`otp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`otp` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(50) NOT NULL,
  `role` ENUM('kandydat', 'pracownikHR') NOT NULL,
  `otp_code` VARCHAR(6) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_otp` (`email`, `role`)
);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


-- =============================================
-- INIT.SQL – dane początkowe dla systemu wyszukiwania ofert pracy
-- =============================================

-- =============================================
-- 1. TABELA: firma (40 przykładowych firm)
-- =============================================
INSERT INTO `firma` (`nazwa`, `strona_www`) VALUES
('Allegro', 'allegro.pl'),
('CD Projekt RED', 'cdprojektred.com'),
('Asseco Poland', 'asseco.pl'),
('Comarch', 'comarch.pl'),
('Netguru', 'netguru.com'),
('Brainly', 'brainly.com'),
('DocPlanner', 'docplanner.com'),
('Booksy', 'booksy.com'),
('T-Mobile Polska', 't-mobile.pl'),
('Orange Polska', 'orange.pl'),
('Play', 'play.pl'),
('ING Tech Poland', 'ingtech.pl'),
('BNP Paribas Technology', 'bnpparibas.pl'),
('Credit Suisse Wroclaw', 'credit-suisse.com'),
('Capgemini Polska', 'capgemini.com/pl'),
('Accenture Polska', 'accenture.com/pl'),
('Sii Polska', 'sii.pl'),
('Nokia Wrocław', 'nokia.com'),
('Motorola Solutions Kraków', 'motorolasolutions.com'),
('HSBC Technology Poland', 'hsbc.com'),
('Sabre Polska', 'sabre.com'),
('Luxoft Poland', 'luxoft.com'),
('EPAM Systems', 'epam.com'),
('Globallogic Polska', 'globallogic.com'),
('Scalo', 'scalo.software'),
('Objectivity', 'objectivity.co.uk'),
('Future Processing', 'future-processing.com'),
('Spyrosoft', 'spyrosoft.com'),
('Unity Technologies Kraków', 'unity.com'),
('Shopee Poland', 'shopee.pl'),
('Bolt Tech', 'bolt.eu'),
('Revolut Poland', 'revolut.com'),
('STX Next', 'stxnext.com'),
('10Clouds', '10clouds.com'),
('Mobica', 'mobica.com'),
('Avenga Poland', 'avenga.com'),
('GFT Poland', 'gft.com'),
('Volvo IT Polska', 'volvo.com'),
('Samsung R&D Institute Poland', 'samsung.com/pl'),
('Roche Global IT Solutions', 'roche.com');

-- =============================================
-- 2. TABELA: kategoriapracy (42 rekordy z hierarchią)
-- =============================================
INSERT INTO `kategoriapracy` (`Nazwa`, `KategoriaPracyid`) VALUES
-- Główne kategorie
('Programowanie', NULL),
('Administracja i DevOps', NULL),
('Testowanie i QA', NULL),
('Analiza i zarządzanie projektami', NULL),
('Data Science i Big Data', NULL),
('Cyberbezpieczeństwo', NULL),
('UX / UI i Grafika', NULL),
('Mobile', NULL),
('Embedded i Hardware', NULL),
('Artificial Intelligence / Machine Learning', NULL),

-- Podkategorie Programowania
('Programowanie Java', 1),
('Programowanie .NET / C#', 1),
('Programowanie Python', 1),
('Programowanie JavaScript / TypeScript', 1),
('Programowanie PHP', 1),
('Programowanie Go', 1),
('Programowanie Rust', 1),
('Programowanie Kotlin', 1),
('Programowanie Scala', 1),
('Programowanie C/C++', 1),

-- Podkategorie Administracja i DevOps
('Administracja serwerami Linux', 2),
('Administracja Windows Server', 2),
('DevOps / SRE', 2),
('Cloud – AWS', 2),
('Cloud – Azure', 2),
('Cloud – Google Cloud', 2),
('Konteneryzacja i Kubernetes', 2),

-- Testowanie i QA
('Testowanie automatyczne', 3),
('Testowanie manualne',3),
('QA Engineer',3),
('Performance Testing',3),

-- Analiza i zarządzanie
('Business Analyst',4),
('Product Owner',4),
('Scrum Master / Agile Coach',4),
('Project Manager',4),

-- Data
('Data Engineer',5),
('Data Analyst',5),
('Data Scientist',5),
('BI Developer',5),

-- Cyberbezpieczeństwo
('Security Engineer',6),
('Pentester',6),
('Security Analyst',6),

-- UX/UI
('UX Designer',7),
('UI Designer',7),
('Graphic Designer',7);


-- =============================================
-- 3. Administratorzy
-- =============================================
INSERT INTO `administrator` (`imie`, `nazwisko`, `plec`, `email`, `haslo`) VALUES
('Jan', 'Kowalski', 'M', 'jan.kowalski@example.com', '$2b$10$PmrYhbFoO1UHS9XkWEmjD.0p3mvqy1A3gvCfO.73srXO7Av1QnbnO'), -- hasło: Password123 (zahashowane bcrypt)
('Anna', 'Nowak', 'K', 'anna.nowak@admin.com', '$$2b$10$AF1Okt7Qbf/BAqnWWjOSl.0dNOyIVBAo6F3Jo10wEk.IyDdzLmv62');  -- hasło: Password1234 (zahashowane bcrypt)

-- =============================================
-- 4. Poziom doświadczenia
-- =============================================
INSERT INTO `poziom` (`nazwa`) VALUES
('praktykant/stażysta'),
('asystent'),
('młodszy specjalista'),
('specjalista'),
('ekspert');

-- =============================================
-- 5. Rodzaj umowy
-- =============================================
INSERT INTO `umowa` (`nazwa`) VALUES
('umowa o pracę'),
('umowa zlecenie'),
('umowa o dzieło'),
('kontrakt B2B'),
('umowa o staż');

-- =============================================
-- 6. Wymiar etatu
-- =============================================
INSERT INTO `wymiar` (`nazwa`) VALUES
('pełny etat'),
('1/2 etatu'),
('część etatu'),
('dodatkowa/tymczasowa'),
('weekendowa');

-- =============================================
-- 7. Tryb pracy
-- =============================================
INSERT INTO `tryb` (`nazwa`) VALUES
('praca stacjonarna'),
('praca hybrydowa'),
('praca zdalna');

-- =============================================
-- Koniec pliku init.sql
-- =============================================