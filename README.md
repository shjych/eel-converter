# Eel-converter

Eel-converter is simple video and music converter made by Eel and ffmpeg.

## For run
Execute this command.
```
pip install -r requirements.txt
python main.py
```

## For distribution
Execute this command.
```
python -m eel main.py web --name eel-converter --onefile --noconsole
```
And Add the following settings to eel-converter.spec.
```
exe = EXE(pyz,
          Tree('ffmpeg',prefix='ffmpeg'),
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='eel-converter',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=False )
```
Finally, execute this command.
```
pyinstaller eel-converter.spec --onefile --noconsole
```
