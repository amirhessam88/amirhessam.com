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
        error_log("Database insert failed: " . $e->getMessage());
        echo "Database insert error: " . $e->getMessage() . "\n";
        return false;
    }
}
?>
