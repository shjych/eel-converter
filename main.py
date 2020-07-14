import eel
import concurrent.futures
import os
import sys
import ffmpeg
import filetype
import shutil
import logging
import multiprocessing
from bottle import post, request, HTTPResponse

tmp_dir_path = "tmp"
log_dir_path = "logs"

logging.basicConfig(level=logging.DEBUG, format='%(funcName)s - %(lineno)s - %(message)s')


@eel.expose
def close():
    if os.path.exists(tmp_dir_path) is True:
        shutil.rmtree(tmp_dir_path)

    if os.path.exists(log_dir_path) is True:
        shutil.rmtree(log_dir_path)


@eel.expose
def remove_element(file_name):
    tmp_path = os.getcwd() + "\\" + tmp_dir_path + "\\" + file_name
    os.remove(tmp_path)


def resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)


def validate(file):
    file_name = file.raw_filename
    file_ext = file.raw_filename.split(".")[1]

    ext_list = ["mp3", "wav", "wave", "m4a", "mp4", "avi", "mpeg", "mpg", "aif", "aiff", "aifc", "au"]

    if (file_ext in ext_list) is False:
        return {"result": False, "file_name": file_name, "message": file_name + "は音楽や映像ファイルではないようです。"}

    if os.path.exists(tmp_dir_path) is False:
        os.mkdir(tmp_dir_path)

    path = os.path.join(tmp_dir_path, file_name)
    file.save(path)

    ext = filetype.guess_extension(path)

    if file_ext != ext:
        os.remove(path)
        return {"result": False, "file_name": file_name, "message": file_name + "は拡張子が偽装されているようです。"}

    return {"result": True, "file_name": file_name, "message": ""}


@post('/validate/<count>', methods=['POST'])
def validate_file(count):
    with concurrent.futures.ThreadPoolExecutor(max_workers=multiprocessing.cpu_count()) as executor:
        results = {executor.submit(validate,  request.files["loadfile" + str(i)]): i for i in range(int(count))}
        body = []
        for future in concurrent.futures.as_completed(results):
            logging.debug(future)
            header = {"Content-Type": "application/json"}
            body.append(future.result())

        bodies = {"messages": body}
        res = HTTPResponse(status=200, body=bodies, headers=header)
        return res


@eel.expose
def convert(file_name: str, convert_ext):
    tmp_path = os.getcwd() + "\\" + tmp_dir_path + "\\" + file_name

    convert_dir_path = "convert"

    if os.path.exists(convert_dir_path) is False:
        os.mkdir(convert_dir_path)

    convert_path = os.getcwd() + "\\" + convert_dir_path + "\\" + file_name.split(".")[0] + "." + convert_ext

    if os.path.exists(log_dir_path) is False:
        os.mkdir(log_dir_path)

    log_path = os.getcwd() + "\\" + log_dir_path + "\\" + file_name.split(".")[0] + ".txt"
    kwargs = {"progress": log_path}

    try:
        stream = ffmpeg.input(tmp_path)
        stream = ffmpeg.output(stream, convert_path, **kwargs)
        stream = ffmpeg.overwrite_output(stream)
        ffmpeg.run(stream)
    except Exception as e:
        print(e)
    finally:
        os.remove(tmp_path)
        return ""


if __name__ == '__main__':
    print(sys.version)
    if os.path.exists(tmp_dir_path) is True:
        shutil.rmtree(tmp_dir_path)

    if os.path.exists(log_dir_path) is True:
        shutil.rmtree(log_dir_path)

    ffmpeg_path = resource_path('./ffmpeg/bin')
    os.environ["Path"] = ffmpeg_path
    eel.init("web")
    eel.start("main.html", mode='chrome', port=8080)
