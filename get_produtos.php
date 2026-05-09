<?php

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "loja_eletronicos";

$conn = new mysqli($host, $user, $pass, $dbname);

$sql = "SELECT * FROM produtos";
$result = $conn->query($sql);

$produtos = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $produtos[] = $row; 
    }
}

// Transforma o array PHP em JSON (Linguagem que o JavaScript entende)
echo json_encode($produtos);

$conn->close();
?>