-- FOR ALL HOME CARE AND AGENCY LLC
-- SQL Server Database Setup Script
-- Run this in SQL Server Management Studio (SSMS) or Azure Data Studio

-- Create Database (if it doesn't exist)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HomeCareDB')
BEGIN
    CREATE DATABASE HomeCareDB;
    PRINT 'Database HomeCareDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database HomeCareDB already exists';
END
GO

-- Use the database
USE HomeCareDB;
GO

-- Create Appointments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
BEGIN
    CREATE TABLE Appointments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        AppointmentId BIGINT NOT NULL UNIQUE,
        EvaluatorName NVARCHAR(255) NOT NULL,
        EvaluatorSignature NVARCHAR(255),
        ParentGuardianName NVARCHAR(255) NOT NULL,
        ClientName NVARCHAR(255) NOT NULL,
        ServiceProviderName NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Phone NVARCHAR(50) NOT NULL,
        Address NVARCHAR(500) NOT NULL,
        AppointmentDate DATE NOT NULL,
        AppointmentTime TIME NOT NULL,
        ServiceTypes NVARCHAR(500) NOT NULL,
        Notes NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'pending',
        SubmittedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table Appointments created successfully';
END
ELSE
BEGIN
    PRINT 'Table Appointments already exists';
END
GO

-- Create Evaluations Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Evaluations' AND xtype='U')
BEGIN
    CREATE TABLE Evaluations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EvaluationId BIGINT NOT NULL UNIQUE,
        AppointmentId BIGINT NOT NULL,
        EvaluationType NVARCHAR(50) NOT NULL,
        EvaluatorName NVARCHAR(255) NOT NULL,
        EvaluatorSignature NVARCHAR(255),
        ParentGuardianName NVARCHAR(255) NOT NULL,
        ClientName NVARCHAR(255) NOT NULL,
        ServiceProviderName NVARCHAR(255) NOT NULL,
        ServiceTypes NVARCHAR(500) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        SubmittedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId) ON DELETE CASCADE
    );
    PRINT 'Table Evaluations created successfully';
END
ELSE
BEGIN
    PRINT 'Table Evaluations already exists';
END
GO

-- Create EvaluationResponses Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EvaluationResponses' AND xtype='U')
BEGIN
    CREATE TABLE EvaluationResponses (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EvaluationId BIGINT NOT NULL,
        QuestionId NVARCHAR(50) NOT NULL,
        Question NVARCHAR(1000) NOT NULL,
        Answer NVARCHAR(MAX),
        QuestionType NVARCHAR(50),
        FOREIGN KEY (EvaluationId) REFERENCES Evaluations(EvaluationId) ON DELETE CASCADE
    );
    PRINT 'Table EvaluationResponses created successfully';
END
ELSE
BEGIN
    PRINT 'Table EvaluationResponses already exists';
END
GO

-- Create Indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_Status' AND object_id = OBJECT_ID('Appointments'))
BEGIN
    CREATE INDEX IX_Appointments_Status ON Appointments(Status);
    PRINT 'Index IX_Appointments_Status created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_SubmittedAt' AND object_id = OBJECT_ID('Appointments'))
BEGIN
    CREATE INDEX IX_Appointments_SubmittedAt ON Appointments(SubmittedAt DESC);
    PRINT 'Index IX_Appointments_SubmittedAt created';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Evaluations_AppointmentId' AND object_id = OBJECT_ID('Evaluations'))
BEGIN
    CREATE INDEX IX_Evaluations_AppointmentId ON Evaluations(AppointmentId);
    PRINT 'Index IX_Evaluations_AppointmentId created';
END
GO

-- Verify tables were created
SELECT 
    t.name AS TableName,
    p.rows AS RowCount
FROM 
    sys.tables t
    INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE 
    t.name IN ('Appointments', 'Evaluations', 'EvaluationResponses')
    AND p.index_id IN (0,1)
ORDER BY 
    t.name;

PRINT '';
PRINT '✓ Database setup complete!';
PRINT 'You can now run your Node.js server with: npm start';
