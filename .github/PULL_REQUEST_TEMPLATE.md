## Before Merging to master:
0. Update `package.json` version
1. Create a build `npm run build`
2. Upload the newly created zip to dropbox
3. Copy the public link from dropbox and paste it in `package.json`:

  ```
  "downloadUrl": {
    "darwin": "https://www.dropbox.com/s/abcdefghijkl/Headset%400.1.0.zip?dl=1"
  }
  ```

4. IMPORTANT: Dropbox provide the link with `dl=0`, you need to change it to `dl=1` so it will be a direct download.
5. Push the changes to the branch and it's ready to merge. 🚀

## Describe Changes:
