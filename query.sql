SELECT * FROM Customers
JOIN Companies
ON Customers.company_id = Companies.company_id;

INSERT INTO Customers (first_name, last_name, rating, company_id)
  VALUES ("Ah Teck", "Tan", 2.5, 1 );

SELECT * FROM Employees JOIN
 Departments ON Employees.department_id =
 Departments.department_id;