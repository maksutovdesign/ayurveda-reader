<?php
// Простой файловый счётчик посещений сайта.
header('Content-Type: application/json');

$file = __DIR__ . '/counter_data.txt';
$count = 0;

$fp = fopen($file, 'c+');
if ($fp) {
    flock($fp, LOCK_EX);
    $content = trim((string)fread($fp, 1024));
    $count = ($content !== '' && ctype_digit($content)) ? (int)$content : 0;
    $count++;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, (string)$count);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

echo json_encode(['count' => $count]);
