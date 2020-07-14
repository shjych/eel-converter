        window.addEventListener('DOMContentLoaded', (event) => {
            window.resizeTo(700, 600);
            PageLoad(event);
        });

        window.addEventListener('beforeunload', (event) => {
          eel.close();
        });

        function getExt(filename)　{
            const pos = filename.lastIndexOf('.');
            if (pos === -1) return '';
            return filename.slice(pos + 1);
        }

        function handleFileSelect(event) {
          event.stopPropagation();
          event.preventDefault();
          event.target.classList.remove('active');

          const files = event.dataTransfer.files;

          const xhr = new XMLHttpRequest();
          const indexes = files.length;
          xhr.open("POST", "http://localhost:8080/validate/" + indexes);
          xhr.responseType = 'json';

          const fd = new FormData();
          for (var i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;
            console.log(file);
            const id = "loadfile" + i;
            fd.append(id, file);
          }

          xhr.send(fd);
          xhr.onload = (event) => {
              const response = xhr.response;
              console.log(response);
              console.log(response['messages'])
              response['messages'].forEach(element => {
                if (element['result'] == true) {
                  const fileNameDiv = '<div class="file-name col-ms-8" value="' + element['file_name'] + '">' + element['file_name'] + '</div>'
                  const dropDown = '<div class="col-ms-4">'
                      + '<select class="custom-select convert-ext">'
                      + '    <option value="mp3">mp3</option>'
                      + '    <option value="m4a">m4a</option>'
                      + '    <option value="mp4">mp4</option>'
                      + '    <option value="mpeg">mpeg</option>'
                      + '    <option value="wav">wav</option>'
                      + '    <option value="avi">avi</option>'
                      + '    <option value="aif">aif</option>'
                      + '    <option value="aiff">aiff</option>'
                      + '    <option value="aifc">aifc</option>'
                      + '    <option value="au">au</option>'
                      + '</select>'
                      + '</div>'
                  const index = document.getElementById('list').children.length
                  const list = '<li class="list-group-item" id = "list-elm-' + index + '">'
                  + '<div class="row">' + fileNameDiv + dropDown
                  + '<button type="button" class="close" aria-label="閉じる" onclick="remove_element(this)">'
                  + '　<span aria-hidden="true">&times;</span>'
                  + '</button>'
                  + '</div>'
                  + '</li>'
                  document.getElementById('list').innerHTML += list
                } else {
                    document.getElementById('error-message').innerHTML = response['message']
                    $('#myModal').modal();
                }
              });
          }
        }

        function convert() {
            [...Array(document.getElementById('list').children.length).keys()].forEach(element => {
                const id = "list-elm-" + element
                const fileNameElm = document.getElementById(id).getElementsByClassName('file-name')[0]
                const fileName = fileNameElm.getAttribute("value");
                const convertExt = document.getElementById(id).getElementsByClassName('convert-ext')[0].value;
                eel.convert(fileName, convertExt)().then( r => {
                    fileNameElm.parentNode.parentNode.remove();
                });
            });
        }

        function remove_element(obj) {
            const fileNameElm = obj.parentNode.getElementsByClassName('file-name')[0]
            console.log(fileNameElm)
            const fileName = fileNameElm.getAttribute("value");
            eel.remove_element(fileName);
            fileNameElm.parentNode.parentNode.remove();
        }

        function handleDragOver(event) {
          event.stopPropagation();
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          event.target.classList.add('active');
        }

        function handleDragLeave(event) {
          event.stopPropagation();
          event.preventDefault();
          event.target.classList.remove('active');
        }

        function PageLoad(event) {
          const dropFrame = document.getElementById('DropFrame');
          dropFrame.addEventListener('dragover', handleDragOver, false);
          dropFrame.addEventListener('dragleave', handleDragLeave, false);
          dropFrame.addEventListener('drop', handleFileSelect, false);
        }