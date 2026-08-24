<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tenantId = env_value('SHAREPOINT_TENANT_ID');
    $clientId = env_value('SHAREPOINT_CLIENT_ID');
    $clientSecret = env_value('SHAREPOINT_CLIENT_SECRET');
    $siteId = env_value('SHAREPOINT_SITE_ID');
    $listId = env_value('SHAREPOINT_LIST_ID');

    if ($tenantId === '' || $clientId === '' || $clientSecret === '' || $siteId === '' || $listId === '') {
        respond(503, ['error' => 'SharePoint connection is not configured on the server.']);
    }

    $token = graph_request(
        'POST',
        'https://login.microsoftonline.com/' . rawurlencode($tenantId) . '/oauth2/v2.0/token',
        http_build_query([
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'scope' => 'https://graph.microsoft.com/.default',
            'grant_type' => 'client_credentials',
        ]),
        ['Content-Type: application/x-www-form-urlencoded']
    );
    if ($token['status'] < 200 || $token['status'] >= 300 || empty($token['body']['access_token'])) {
        respond(502, ['error' => 'Microsoft Graph authentication failed.']);
    }

    $graphSiteId = $siteId;
    if (preg_match('/^([^:]+):\/?(.+?):?$/', $siteId, $matches) === 1 && strpos($matches[1], '.sharepoint.com') !== false) {
        $sitePath = preg_replace('/^\/+|:$/', '', $matches[2]);
        $site = graph_request(
            'GET',
            'https://graph.microsoft.com/v1.0/sites/' . $matches[1] . ':/' . $sitePath,
            null,
            ['Authorization: Bearer ' . $token['body']['access_token'], 'Accept: application/json']
        );
        if ($site['status'] < 200 || $site['status'] >= 300 || empty($site['body']['id'])) {
            respond(502, ['error' => 'Microsoft Graph could not find the configured SharePoint site.']);
        }
        $graphSiteId = $site['body']['id'];
    }

    $items = graph_request(
        'GET',
        'https://graph.microsoft.com/v1.0/sites/' . rawurlencode($graphSiteId) . '/lists/' . rawurlencode($listId) . '/items?expand=fields',
        null,
        ['Authorization: Bearer ' . $token['body']['access_token'], 'Accept: application/json']
    );

    if ($items['status'] === 404) {
        $lists = graph_request(
            'GET',
            'https://graph.microsoft.com/v1.0/sites/' . rawurlencode($graphSiteId) . "/lists?\$select=id,name,displayName&\$filter=displayName%20eq%20'Contact'",
            null,
            ['Authorization: Bearer ' . $token['body']['access_token'], 'Accept: application/json']
        );
        $contactList = $lists['body']['value'][0] ?? null;
        if (!empty($contactList['id'])) {
            $items = graph_request(
                'GET',
                'https://graph.microsoft.com/v1.0/sites/' . rawurlencode($graphSiteId) . '/lists/' . rawurlencode($contactList['id']) . '/items?expand=fields',
                null,
                ['Authorization: Bearer ' . $token['body']['access_token'], 'Accept: application/json']
            );
        }
    }

    if ($items['status'] < 200 || $items['status'] >= 300) {
        $message = $items['body']['error']['message'] ?? 'Check the SharePoint site and contact list IDs.';
        respond(502, ['error' => 'Microsoft Graph returned HTTP ' . $items['status'] . ': ' . $message]);
    }

    $result = [];
    foreach (($items['body']['value'] ?? []) as $item) {
        $result[] = [
            'id' => (string)($item['id'] ?? ''),
            'createdDateTime' => $item['createdDateTime'] ?? null,
            'lastModifiedDateTime' => $item['lastModifiedDateTime'] ?? null,
            'webUrl' => $item['webUrl'] ?? null,
            'fields' => $item['fields'] ?? [],
        ];
    }
    respond(200, ['items' => $result]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Only POST requests are allowed.']);
}

$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    respond(400, ['error' => 'Invalid JSON request.']);
}

$clientName = trim((string)($payload['clientName'] ?? ''));
$email = trim((string)($payload['email'] ?? ''));
if ($clientName === '' || $email === '') {
    respond(400, ['error' => 'Client name and email are required.']);
}

$tenantId = env_value('SHAREPOINT_TENANT_ID');
$clientId = env_value('SHAREPOINT_CLIENT_ID');
$clientSecret = env_value('SHAREPOINT_CLIENT_SECRET');
$siteId = env_value('SHAREPOINT_SITE_ID');
$listId = env_value('SHAREPOINT_LIST_ID');

if ($tenantId === '' || $clientId === '' || $clientSecret === '' || $siteId === '' || $listId === '') {
    respond(503, ['error' => 'SharePoint connection is not configured on the server.']);
}

$fields = [
    'Title' => substr((string)($payload['title'] ?? 'New Web Inquiry') . ' - ' . $clientName, 0, 255),
    'BusinessEmail' => $email,
    'PhoneNumber' => trim((string)($payload['phone'] ?? '')),
    'Company' => $clientName,
    'Interest' => trim((string)($payload['service'] ?? 'General Inquiry')),
    'ProjectDetails' => trim((string)($payload['notes'] ?? '')),
];

$token = graph_request(
    'POST',
    'https://login.microsoftonline.com/' . rawurlencode($tenantId) . '/oauth2/v2.0/token',
    http_build_query([
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'scope' => 'https://graph.microsoft.com/.default',
        'grant_type' => 'client_credentials',
    ]),
    ['Content-Type: application/x-www-form-urlencoded']
);

if ($token['status'] < 200 || $token['status'] >= 300 || empty($token['body']['access_token'])) {
    respond(502, ['error' => 'Microsoft Graph authentication failed.']);
}

$graphSiteId = $siteId;
if (preg_match('/^([^:]+):\/?(.+?):?$/', $siteId, $matches) === 1 && strpos($matches[1], '.sharepoint.com') !== false) {
    $sitePath = preg_replace('/^\/+|:$/', '', $matches[2]);
    $site = graph_request(
        'GET',
        'https://graph.microsoft.com/v1.0/sites/' . $matches[1] . ':/' . $sitePath,
        null,
        ['Authorization: Bearer ' . $token['body']['access_token']]
    );
    if ($site['status'] < 200 || $site['status'] >= 300 || empty($site['body']['id'])) {
        respond(502, ['error' => 'Microsoft Graph could not find the configured SharePoint site.']);
    }
    $graphSiteId = $site['body']['id'];
}

$item = graph_request(
    'POST',
    'https://graph.microsoft.com/v1.0/sites/' . rawurlencode($graphSiteId) . '/lists/' . rawurlencode($listId) . '/items',
    json_encode(['fields' => $fields], JSON_UNESCAPED_SLASHES),
    [
        'Authorization: Bearer ' . $token['body']['access_token'],
        'Content-Type: application/json',
        'Accept: application/json',
    ]
);

if ($item['status'] < 200 || $item['status'] >= 300) {
    $message = $item['body']['error']['message'] ?? 'Microsoft Graph rejected the SharePoint item.';
    respond(502, ['error' => 'Microsoft Graph returned HTTP ' . $item['status'] . ': ' . $message]);
}

respond(201, ['item' => $item['body']]);

function env_value(string $name): string
{
    $value = getenv($name);
    if ($value === false && isset($_ENV[$name])) {
        $value = $_ENV[$name];
    }
    return trim((string)($value === false ? '' : $value), " \t\n\r\0\x0B\"");
}

function graph_request(string $method, string $url, ?string $body, array $headers): array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    if ($body !== null) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    if ($raw === false) {
        respond(502, ['error' => 'Unable to reach Microsoft Graph: ' . $error]);
    }
    $decoded = json_decode($raw, true);
    return ['status' => $status, 'body' => is_array($decoded) ? $decoded : []];
}

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}
