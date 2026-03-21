CREATE TABLE Employes (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Identification VARCHAR(20) NOT NULL UNIQUE,
    [Name] VARCHAR(100) NOT NULL,
    LastNames VARCHAR(100) NOT NULL,
    Shift VARCHAR(50) NOT NULL,
    Salary DECIMAL(10,2) NOT NULL
)

CREATE TABLE Rols (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    [Name] VARCHAR(100) NOT NULL UNIQUE
)

CREATE TABLE [Users] (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    [Name] VARCHAR(100) NOT NULL,
    [Password] VARCHAR(255) NOT NULL,
    ID_Employe INT NOT NULL UNIQUE,
    ID_Rol INT NOT NULL,

    CONSTRAINT FK_Usuarios_Empleados
        FOREIGN KEY (ID_Employe) REFERENCES Employes(ID),

    CONSTRAINT FK_Usuarios_Roles
        FOREIGN KEY (ID_Rol) REFERENCES Rols(ID)
)



CREATE TABLE Permissions (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    [Name] VARCHAR(100) NOT NULL UNIQUE,
    [Description] VARCHAR(255)
)


CREATE TABLE Rol_Permission (
    ID_Rol INT NOT NULL,
    ID_Permission INT NOT NULL,
    PRIMARY KEY (ID_Rol, ID_Permission),

    CONSTRAINT FK_RolPermiso_Rol
        FOREIGN KEY (ID_Rol) REFERENCES Rols(ID),

    CONSTRAINT FK_RolPermiso_Permiso
        FOREIGN KEY (ID_Permission) REFERENCES Permissions(ID)
)

INSERT INTO Employes (Identification, [Name], LastNames, Shift, Salary)
VALUES ('702910420', 'Dayron', 'Ortiz Alvarado', 'Diurno', 650000.00)

INSERT INTO Employes (Identification, [Name], LastNames, Shift, Salary)
VALUES ('1', 'PruebaDelete', 'Ortiz Alvarado', 'Diurno', 650000.00)

Select * from Employes
where ID = 5