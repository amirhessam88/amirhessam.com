<?php
// Database configuration for PostgreSQL
// Uses environment variables from .htaccess for security

// Try to get credentials from environment variables
// Works for both web context (.htaccess) and command line (.bashrc)
$db_username = $_ENV['DATABASE_USERNAME'] ?? getenv('DATABASE_USERNAME') ?? '';
$db_password = $_ENV['DATABASE_PASSWORD'] ?? getenv('DATABASE_PASSWORD') ?? '';

$db_config = [
    'host' => 'localhost', // Usually localhost for cPanel
    'port' => '5432', // Default PostgreSQL port
    'dbname' => 'amirhessam_main', // Your database name
    'user' => $db_username,
    'password' => $db_password,
    'schema' => 'amirhessam_com', // Your schema name
    'table' => 'google_scholar_stats' // Your table name
];

// Function to get database connection
function getDbConnection($config) {
    // Validate that environment variables are set
    if (empty($config['user']) || empty($config['password'])) {
        error_log("Database credentials not found in environment variables. Please check your .htaccess file.");
        return false;
    }
    
    try {
        $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}";
        $pdo = new PDO($dsn, $config['user'], $config['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Function to insert stats into database
function insertStatsToDb($pdo, $config, $citations, $papers, $hindex) {
    try {
        $table_name = $config['schema'] . '.' . $config['table'];
        $current_timestamp = date('Y-m-d H:i:s');
        
        echo "Attempting to insert into table: {$table_name}\n";
        echo "Values: timestamp={$current_timestamp}, citations={$citations}, papers={$papers}, h_index={$hindex}\n";
        
        // First, check if the schema exists and we have access
        $check_schema_sql = "SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?";
        $stmt = $pdo->prepare($check_schema_sql);
        $stmt->execute([$config['schema']]);
        if ($stmt->rowCount() == 0) {
            echo "ERROR: Schema '{$config['schema']}' does not exist!\n";
            return false;
        }
        echo "Schema '{$config['schema']}' exists.\n";
        
        // Check if table exists
        $check_table_sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = ?";
        $stmt = $pdo->prepare($check_table_sql);
        $stmt->execute([$config['schema'], $config['table']]);
        if ($stmt->rowCount() == 0) {
            echo "ERROR: Table '{$table_name}' does not exist!\n";
            return false;
        }
        echo "Table '{$table_name}' exists.\n";
        
        $sql = "INSERT INTO {$table_name} (timestamp, citations, papers, h_index) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        $result = $stmt->execute([$current_timestamp, $citations, $papers, $hindex]);
        
        if ($result) {
            echo "Stats successfully inserted into database with timestamp: $current_timestamp\n";
            return true;
        } else {
            echo "Failed to insert stats into database\n";
            return false;
        }
    } catch (PDOException $e) {
        $error_msg = $e->getMessage();
        error_log("Database insert failed: " . $error_msg);
        echo "Database insert error: " . $error_msg . "\n";
        
        // Check if it's a permission error
        if (strpos($error_msg, 'permission denied') !== false || strpos($error_msg, '42501') !== false) {
            echo "\nPERMISSION ERROR DETECTED!\n";
            echo "Your database user '{$config['user']}' does not have INSERT permission on table {$table_name}\n";
            echo "\nTo fix this, run these SQL commands in PostgreSQL:\n";
            echo "  GRANT USAGE ON SCHEMA {$config['schema']} TO {$config['user']};\n";
            echo "  GRANT ALL PRIVILEGES ON TABLE {$table_name} TO {$config['user']};\n";
        }
        
        return false;
    }
}
?>
