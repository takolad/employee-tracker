USE staffDB;

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Legal'), ('Finance');

INSERT INTO role (title, salary, department_id)
VALUES ('Salesperson', 80000.00, 1), ('Sales Lead', 100000.00, 1),
('Engineer', 125000, 2), ('Lead Engineer', 150000, 2),
('Lawyer', 190000, 3), ('Legal Team Lead', 250000, 3),
('Accountant', 125000, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ('Bill', 'Preston', 3), ('Ted', 'Logan', 4), 
('Cheryl', 'Mason', 7), ('Dash', 'Rendar', 1),
('Rinoa', 'Heartilly', 6);

UPDATE employee
SET manager_id = 2
WHERE id = 1 AND 4;