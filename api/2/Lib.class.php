<?php
/**
 * Library class (helper methods / functions)
 *
 * @author UP608985
 */
class Lib {
    // Reid Johnson, RJ. (2014). Parsing multipart/form-data in php for PUT requests. Retrieved 22/03/2015, from http://codereview.stackexchange.com/questions/69882/parsing-multipart-form-data-in-php-for-put-requests
    public static function parse_input(&$insertArr)
    {
        // <editor-fold defaultstate="collapsed" desc="parse_input">
        $content_type = ( isset($_SERVER['CONTENT_TYPE']) ) ? $_SERVER['CONTENT_TYPE'] : 'application/x-www-form-urlencoded';

        $tmp = explode(';', $content_type);
        $boundary = '';
        $encoding = '';

        $content_type = array_shift($tmp);

        foreach ($tmp as $t) {
            if (strpos($t, 'boundary') !== false) {
                $t = explode('=', $t, 2);
                if (isset($t[1]))
                    $boundary = '--' . $t[1];
            }
            else if (strpos($t, 'charset') !== false) {
                $t = explode('=', $t, 2);
                if (isset($t[1]))
                    $encoding = $t[1];
            }
            if ($boundary !== '' && $encoding !== '')
                break;
        }

        switch ($content_type) {
            case 'multipart/form-data':
                #grab multipart boundary from content type header
                if (!empty($boundary))
                    break;
                $this->content_type = 'application/x-www-form-urlencoded';
            case 'application/x-www-form-urlencoded':
                parse_str(file_get_contents('php://input'), $insertArr);
                return;
            default:
                return;
        }

        $_FILES = array();
        $insertArr = array();
        $chunkLength = 8096;
        $raw_headers = '';

        $stream = fopen('php://input', 'rb');

        $sanity = fgets($stream, strlen($boundary) + 5);

        if (rtrim($sanity) !== $boundary) #malformed file, boundary should be first item
            return;

        while (( $chunk = fgets($stream) ) !== false) {
            if ($chunk === $boundary)
                continue;

            if (rtrim($chunk) == '') { #blank line means we have all the headers and are going to read content
                $raw_headers = explode("\r\n", $raw_headers);
                $headers = array();
                $matches = array();

                foreach ($raw_headers as $header) {
                    if (strpos($header, ':') === false)
                        continue;
                    list( $name, $value ) = explode(':', $header, 2);
                    $headers[strtolower($name)] = ltrim($value, ' ');
                }

                $raw_headers = '';

                if (!isset($headers['content-disposition']))
                    continue;

                $filename = NULL;
                preg_match(
                        '/^(.+); *name="([^"]+)"(; *filename="([^"]+)")?/', $headers['content-disposition'], $matches
                );
                list(, $type, $name ) = $matches;

                #process data
                if (isset($matches[4])) { #pull in file
                    $error = UPLOAD_ERR_OK;

                    $filename = $matches[4];
                    $filename_parts = pathinfo($filename);
                    $contentType = 'unknown';

                    if (isset($headers['content-type'])) {
                        $tmp = explode(';', $headers['content-type']);
                        $contentType = $tmp[0];
                    }

                    $tmpnam = tempnam(ini_get('upload_tmp_dir'), 'php');
                    $fileHandle = fopen($tmpnam, 'wb');


                    if ($fileHandle === false)
                        $error = UPLOAD_ERR_CANT_WRITE;
                    else {
                        $lastLine = NULL;
                        while (( $chunk = fgets($stream, $chunkLength) ) !== false && strpos($chunk, $boundary) !== 0) {
                            if ($lastLine !== NULL) {
                                if (fwrite($fileHandle, $lastLine) === false) {
                                    $error = UPLOAD_ERR_CANT_WRITE;
                                    break;
                                }
                            }
                            $lastLine = $chunk;
                        }

                        if ($lastLine !== NULL && $error !== UPLOAD_ERR_CANT_WRITE) {
                            if (fwrite($fileHandle, rtrim($lastLine, "\r\n")) === false)
                                $error = UPLOAD_ERR_CANT_WRITE;
                        }
                    }

                    $items = array(
                        'name' => $filename,
                        'type' => $contentType,
                        'tmp_name' => $tmpnam,
                        'error' => $error,
                        'size' => filesize($tmpnam)
                    );

                    $tmp = explode('[', $name, 2);

                    foreach ($items as $index => $item) {
                        $spec = $index;
                        if (count($tmp) > 1)
                            $spec .= '[' . $tmp[1];
                        $t = $spec . '=' . $item;
                        parse_str($t, $array2);
                        $_FILES = self::recursive_setter($spec, $_FILES, $array2);
                    }

                    continue;
                }
                else { #pull in variable
                    $fullValue = '';
                    $lastLine = NULL;
                    while (( $chunk = fgets($stream) ) !== false && strpos($chunk, $boundary) !== 0) {
                        if ($lastLine !== NULL)
                            $fullValue .= $lastLine;

                        $lastLine = $chunk;
                    }

                    if ($lastLine !== NULL)
                        $fullValue .= rtrim($lastLine, "\r\n");

                    if (isset($headers['content-type'])) {
                        $tmp = explode(';', $headers['content-type']);
                        $encoding = '';

                        foreach ($tmp as $t) {
                            if (strpos($t, 'charset') !== false) {
                                $t = explode($t, '=', 2);
                                if (isset($t[1]))
                                    $encoding = $t[1];
                                break;
                            }
                        }

                        if ($encoding !== '' && strtoupper($encoding) !== 'UTF-8' && strtoupper($encoding) !== 'UTF8') {
                            $tmp = mb_convert_encoding($fullValue, 'UTF-8', $encoding);
                            if ($tmp !== false)
                                $fullValue = $tmp;
                        }
                    }

                    $fullValue = $name . '=' . $fullValue;
                    $origName = $name;
                    $tmp = array();
                    parse_str($fullValue, $tmp);
                    $insertArr = self::recursive_setter($origName, $insertArr, $tmp);
                }
                continue;
            }

            $raw_headers .= $chunk;
        }

        fclose($stream);
        // </editor-fold>
    }

    // Reid Johnson, RJ. (2014). Parsing multipart/form-data in php for PUT requests. Retrieved 22/03/2015, from http://codereview.stackexchange.com/questions/69882/parsing-multipart-form-data-in-php-for-put-requests
    private static function recursive_setter($spec, &$array, &$array2)
    {
        // <editor-fold defaultstate="collapse" desc="recursive_setter">
        if (!is_array($spec))
            $spec = explode('[', (string) $spec);
        $currLev = array_shift($spec);
        $currLev = rtrim($currLev, ']');
        if ($currLev !== '') {
            $currLev = $currLev . '=p';
            $tmp = array();
            parse_str($currLev, $tmp);
            $tmp = array_keys($tmp);
            $currLev = reset($tmp);
        }

        if (!is_array($array)) {
            $array = $array2;
        } else if ($currLev === '') {
            $array[] = reset($array2);
        } else if (isset($array[$currLev]) && isset($array2[$currLev])) {
            $array[$currLev] = self::recursive_setter($spec, $array[$currLev], $array2[$currLev]);
        } else if (isset($array2[$currLev])) {
            $array[$currLev] = $array2[$currLev];
        }
        return $array;

        if (!is_array($spec))
            $spec = explode('[', (string) $spec);
        $currLev = array_shift($spec);
        $currLev = rtrim($currLev, ']');
        if ($currLev !== '') {
            $currLev = $currLev . '=p';
            $tmp = array();
            parse_str($currLev, $tmp);
            $tmp = array_keys($tmp);
            $currLev = reset($tmp);
        }

        if (!is_array($array)) {
            $array = $array2;
        } else if ($currLev === '') {
            $array[] = reset($array2);
        } else if (isset($array[$currLev]) && isset($array2[$currLev])) {
            $array[$currLev] = self::recursive_setter($spec, $array[$currLev], $array2[$currLev]);
        } else if (isset($array2[$currLev])) {
            $array[$currLev] = $array2[$currLev];
        }
        return $array;
        // </editor-fold>
    }
}
