INSERT INTO department (name)
VALUES  ("Sales"),
        ("Finance"),
        ("Marketing"),
        ("Shipping");

INSERT INTO role (title, salary, department_id)
VALUES  ("Account Manager", 90000, 1),
        ("Accountant", 80000, 2),
        ("Salesperson", 70000, 1),
        ("Advertiser", 60000, 3),
        ("Secretary", 50000, 1),
        ("Shipper", 40000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Joe", "Black", 1, NULL),
        ("Sara", "Medley", 3, 1),
        ("Joanne", "Weathers", 2, NULL),
        ("Matt", "Heart", 2, 2),
        ("Randy", "Sleeman", 4, NULL),
        ("Celine", "Maxwell", 4, 5),
        ("Rachel", "Collins", 5, 1),
        ("Tom", "Raddler", 6, NULL);
        