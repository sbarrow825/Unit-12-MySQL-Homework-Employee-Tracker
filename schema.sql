DROP DATABASE IF EXISTS employeeTracker_DB;
CREATE DATABASE employeeTracker_DB;

USE employeeTracker_DB;

CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE role(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id),
    PRIMARY KEY (id)
);

CREATE TABLE employees(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT NOT NULL,
    manager_id INT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id),
    PRIMARY KEY (id)
);

INSERT INTO department (name)
VALUES ("Sales");

INSERT INTO department (name)
VALUES ("Engineering");

INSERT INTO role (title, salary, department_id)
VALUES ("Software Engineer", "150000", 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Software Lead", "400000", 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", "300000", 1);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Jerome", "Chenette", 2, null);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Sam", "Barrow", 1, 1);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("JC", "Zhang", 3, null);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Gabriel", "Sucich", 1, 1);

* **department**:

  * **id** - INT PRIMARY KEY
  * **name** - VARCHAR(30) to hold department name

* **role**:

  * **id** - INT PRIMARY KEY
  * **title** -  VARCHAR(30) to hold role title
  * **salary** -  DECIMAL to hold role salary
  * **department_id** -  INT to hold reference to department role belongs to

* **employee**:

  * **id** - INT PRIMARY KEY
  * **first_name** - VARCHAR(30) to hold employee first name
  * **last_name** - VARCHAR(30) to hold employee last name
  * **role_id** - INT to hold reference to role employee has
  * **manager_id** - INT to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager