<?php

include 'config.php'; 

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM produtos";
    $stmt = $pdo->query($sql);
    
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($produtos);

} catch (PDOException $e) {
    echo json_encode(['erro' => $e->getMessage()]);
}
?>