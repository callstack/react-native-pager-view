package com.pagerviewexample;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        findViewById(R.id.fabric).setOnClickListener(view -> startActivity(new Intent(MainActivity.this, FabricActivity.class)));
        findViewById(R.id.paper).setOnClickListener(view -> startActivity(new Intent(MainActivity.this, PaperActivity.class)));
    }
}