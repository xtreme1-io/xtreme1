## Example

```javascript
 {
        // or camera_internal
        "cameraInternal": {
            "fx": 933.4667,
            "fy": 934.6754,
            "cx": 896.4692,
            "cy": 507.3557
        },
        "width": 1920,
        "height": 1080,
        // or camera_external
        "cameraExternal": [
            -0.7209479393140598,
            -0.04004438206239668,
            -0.6918312773097581,
            0,
            0.6911177056736608,
            0.0317737123271339,
            -0.7220434530617444,
            0,
            0.05089583188421044,
            -0.9986925846676711,
            0.004768189029478265,
            0,
            0.009297776700688867,
            1.6581292167169648,
            -1.0197515012137728,
            1
        ],
        "rowMajor": false
    },
```
* **width** : Image width.
* **height** : Image height.
* **cameraExternal** : Intrinsic parameters of camera.
* **cameraInternal** : Camera matrix with `4x4`.
* **rowMajor** : Whether `cameraExternal` is the row-major order or not, default is `true`.

Refer to [ Camera Calibration and 3D Reconstruction ](https://docs.opencv.org/2.4/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html)