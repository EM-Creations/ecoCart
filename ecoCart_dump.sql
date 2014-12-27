-- phpMyAdmin SQL Dump
-- version 4.1.6
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Dec 27, 2014 at 01:07 PM
-- Server version: 5.5.36
-- PHP Version: 5.4.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `ecocart`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `id` tinyint(1) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `parent_id`) VALUES
(1, 'Media', 0),
(2, 'Books', 1),
(3, 'Movies', 1),
(4, 'Home and Garden', 0),
(5, 'Stationary', 4),
(6, 'Electronics', 0),
(7, 'Sports', 0),
(8, 'Toys', 0);

-- --------------------------------------------------------

--
-- Table structure for table `delivery_option`
--

CREATE TABLE IF NOT EXISTS `delivery_option` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `max_weight` double NOT NULL,
  `eco_rating` int(11) NOT NULL,
  `cost` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `delivery_option`
--

INSERT INTO `delivery_option` (`id`, `name`, `max_weight`, `eco_rating`, `cost`) VALUES
(1, 'Local pickup', 1000, 7, 0),
(2, 'Royal Mail Letter (2nd Class)', 0.1, 8, 0.75),
(3, 'Royal Mail Letter (1st Class)', 0.1, 8, 0.95),
(4, 'Royal Mailed (Signed for) Parcel', 2, 7, 6.99),
(5, 'Courier', 30, 4, 8.99),
(6, 'Drone', 15, 9, 19.99);

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE IF NOT EXISTS `item` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cat` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `weight` double NOT NULL,
  `featured` tinyint(1) NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`id`, `cat`, `name`, `description`, `weight`, `featured`, `price`) VALUES
(1, 6, 'Calculator', 'Superb classic calculator for home and business use.', 0.1, 1, 1.99),
(2, 6, '22 in PC monitor', 'Brand new 22 inch wide screen PC monitor.', 2, 1, 119.99),
(3, 5, 'Paperclip', 'Steel paperclips, always needed.', 0.001, 1, 0.39),
(4, 5, 'Colouring pencils set', 'Set of 5 colouring pencils: red, green, pink, black, yellow', 0.05, 1, 0.99);

-- --------------------------------------------------------

--
-- Table structure for table `item_image`
--

CREATE TABLE IF NOT EXISTS `item_image` (
  `item_id` int(11) NOT NULL,
  `image` varchar(100) NOT NULL,
  `main` tinyint(1) NOT NULL,
  PRIMARY KEY (`item_id`,`image`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `item_image`
--

INSERT INTO `item_image` (`item_id`, `image`, `main`) VALUES
(1, 'default-calculator.jpg', 1),
(2, 'default-monitor.jpg', 1),
(3, 'default-paperclip.jpg', 1),
(4, 'default-pencils.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE IF NOT EXISTS `order` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` enum('Mr','Mrs','Miss','Ms','Dr') NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `address_1` varchar(100) NOT NULL,
  `address_2` varchar(100) NOT NULL,
  `post_code` char(8) NOT NULL,
  `delivery` bigint(20) NOT NULL,
  `created` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE IF NOT EXISTS `order_item` (
  `order_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`order_id`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE IF NOT EXISTS `setting` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `name`, `value`) VALUES
(1, 'url', 'http://localhost/WEBSCRP/Coursework/ecoCart/'),
(2, 'name', 'ecoCart');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
